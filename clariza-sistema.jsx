import { useState, useEffect, useRef } from "react";

// ─── PALETA ──────────────────────────────────────────────────────
const C = {
  bg:"#0D1B12", card:"#142019", surface:"#1A2B20", border:"#243B2A",
  g1:"#34D399", g2:"#10B981", g3:"#059669", g4:"#047857",
  text:"#F0FDF4", sub:"#86EFAC", muted:"#4ADE80", dim:"#6B7280",
  yellow:"#FCD34D", red:"#F87171", orange:"#FB923C", blue:"#60A5FA",
  white:"#FFFFFF",
};

// ─── DADOS INICIAIS ───────────────────────────────────────────────
const PRODUTOS_INICIAL = [
  { id:"P001", nome:"Vestido Clariza Fenda", cat:"Infantil Feminino", tam:"8 anos", cor:"Rosa", custo:35, preco:79, estoque:8, foto:"👗", ativo:true },
  { id:"P002", nome:"Conjunto Brasil Masculino", cat:"Infantil Masculino", tam:"10 anos", cor:"Verde", custo:25, preco:55, estoque:12, foto:"👕", ativo:true },
  { id:"P003", nome:"Vestido Quadrilha Azul", cat:"Infantil Feminino", tam:"10 anos", cor:"Azul", custo:40, preco:165, estoque:3, foto:"💃", ativo:true },
  { id:"P004", nome:"Camisa Brasil Juvenil", cat:"Juvenil Masculino", tam:"M", cor:"Verde", custo:28, preco:49, estoque:15, foto:"👕", ativo:true },
  { id:"P005", nome:"Short Saia Jeans", cat:"Infantil Feminino", tam:"10 anos", cor:"Azul", custo:30, preco:55, estoque:6, foto:"👖", ativo:true },
  { id:"P006", nome:"Pijama Infantil Menina", cat:"Bebê/Infantil", tam:"2 anos", cor:"Rosa", custo:22, preco:45, estoque:20, foto:"🌙", ativo:true },
  { id:"P007", nome:"Fantasia Homem Aranha", cat:"Fantasias", tam:"6 anos", cor:"Vermelho", custo:35, preco:70, estoque:4, foto:"🕷️", ativo:true },
  { id:"P008", nome:"Blazer Cropped Juvenil", cat:"Juvenil Feminino", tam:"M", cor:"Preto", custo:39, preco:89, estoque:5, foto:"🧥", ativo:true },
  { id:"P009", nome:"Boné Brasil", cat:"Acessórios", tam:"Único", cor:"Verde", custo:12, preco:25, estoque:18, foto:"🧢", ativo:true },
  { id:"P010", nome:"Macaquinho Crepe BB", cat:"Bebê/Infantil", tam:"1 ano", cor:"Bege", custo:20, preco:35, estoque:10, foto:"👶", ativo:true },
];

const USUARIOS = [
  { id:"U1", nome:"Regiane", perfil:"adm", login:"adm", senha:"clariza2024" },
  { id:"U2", nome:"Vendedora 1", perfil:"vendedora", login:"venda1", senha:"1234" },
  { id:"U3", nome:"Vendedora 2", perfil:"vendedora", login:"venda2", senha:"1234" },
];

// ─── UTILITÁRIOS ──────────────────────────────────────────────────
const fmtR = v => "R$ " + Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const hoje = () => new Date().toLocaleDateString("pt-BR");
const agora = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const genId = () => Math.random().toString(36).substr(2,8).toUpperCase();

function gerarQRData(produto) {
  return `CLARIZA|${produto.id}|${produto.nome}|${produto.preco}`;
}

// Gera QR Code visual simplificado com CSS (padrão de blocos)
function QRCodeVisual({ data, size = 120 }) {
  const hash = data.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const grid = 10;
  const cells = [];
  for (let r=0;r<grid;r++) for (let c=0;c<grid;c++) {
    const v = ((hash*(r*grid+c+1)*7+r*13+c*17)%100) > 42;
    const corner = (r<2&&c<2)||(r<2&&c>grid-3)||(r>grid-3&&c<2);
    cells.push(<div key={r+"-"+c} style={{
      width:size/grid, height:size/grid,
      background: (v||corner) ? "#000" : "#fff",
      border:"none",
    }}/>);
  }
  // Cantos fixos
  return (
    <div style={{background:"#fff",padding:6,borderRadius:4,display:"inline-block",boxShadow:"0 2px 8px #0004"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${grid},${size/grid}px)`,gap:0}}>{cells}</div>
    </div>
  );
}

// Código de barras visual
function BarcodeVisual({ code, width=180, height=50 }) {
  const bars = code.split("").map((c,i)=>{
    const w = ((c.charCodeAt(0)*7+i*3)%3)+1;
    const black = ((c.charCodeAt(0)+i)%2)===0;
    return <div key={i} style={{width:w,height:height,background:black?"#000":"#fff",display:"inline-block"}}/>;
  });
  return (
    <div style={{background:"#fff",padding:"6px 10px 2px",borderRadius:4,display:"inline-block"}}>
      <div style={{display:"flex",alignItems:"flex-end",height:height}}>{bars}</div>
      <p style={{margin:"2px 0 0",fontSize:9,textAlign:"center",fontFamily:"monospace",color:"#000"}}>{code}</p>
    </div>
  );
}

// ─── COMPONENTES BASE ─────────────────────────────────────────────
const Btn = ({children, onClick, color=C.g2, small, full, outline, disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: outline ? "transparent" : disabled ? C.border : color,
    color: outline ? color : C.white,
    border: `1.5px solid ${disabled ? C.border : color}`,
    borderRadius:10, padding: small?"6px 14px":"10px 20px",
    fontSize: small?11:13, fontWeight:700, cursor: disabled?"not-allowed":"pointer",
    width: full?"100%":"auto", opacity: disabled?0.5:1,
    transition:"all 0.15s",
  }}>{children}</button>
);

const Input = ({label, value, onChange, type="text", placeholder, small}) => (
  <div style={{marginBottom:small?6:12}}>
    {label && <p style={{margin:"0 0 4px",fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</p>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
        padding: small?"6px 10px":"9px 12px",color:C.text,fontSize:small?11:13,
        boxSizing:"border-box",outline:"none"}}/>
  </div>
);

const Select = ({label, value, onChange, options}) => (
  <div style={{marginBottom:12}}>
    {label && <p style={{margin:"0 0 4px",fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</p>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
        padding:"9px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
);

const Card = ({children, style={}}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18,...style}}>{children}</div>
);

const Badge = ({label, color=C.g2}) => (
  <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,
    padding:"2px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
);

const Modal = ({title, onClose, children, wide}) => (
  <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000a",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:24,
      width:"100%",maxWidth:wide?700:480,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h3 style={{margin:0,color:C.text,fontSize:15,fontWeight:900}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Toast = ({msg, type="success"}) => (
  <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
    background: type==="error"?C.red:C.g2, color:C.bg,
    padding:"10px 24px",borderRadius:30,fontWeight:800,fontSize:13,zIndex:2000,
    boxShadow:"0 4px 24px #0006"}}>
    {type==="error"?"❌":"✅"} {msg}
  </div>
);

// ─── TELA DE LOGIN ────────────────────────────────────────────────
function TelaLogin({onLogin}) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const entrar = () => {
    const u = USUARIOS.find(u=>u.login===login&&u.senha===senha);
    if (u) onLogin(u);
    else setErro("Login ou senha incorretos");
  };
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:8}}>👗</div>
          <h1 style={{margin:0,color:C.g1,fontSize:28,fontWeight:900,letterSpacing:"0.04em"}}>CLARIZA KIDS</h1>
          <p style={{margin:"4px 0 0",color:C.sub,fontSize:13}}>Sistema de Gestão</p>
        </div>
        <Card>
          <Input label="Usuário" value={login} onChange={setLogin} placeholder="seu login"/>
          <Input label="Senha" value={senha} onChange={setSenha} type="password" placeholder="••••••"/>
          {erro && <p style={{color:C.red,fontSize:12,margin:"0 0 10px",textAlign:"center"}}>{erro}</p>}
          <Btn full onClick={entrar} color={C.g2}>ENTRAR</Btn>
          <div style={{marginTop:16,padding:12,background:C.surface,borderRadius:8}}>
            <p style={{margin:0,fontSize:10,color:C.dim,textAlign:"center"}}>
              ADM: adm / clariza2024 · Vendedora: venda1 / 1234
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PDV — PONTO DE VENDA ─────────────────────────────────────────
function TelaPDV({usuario, produtos, onVenda, toast}) {
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [forma, setForma] = useState("PIX");
  const [scanning, setScanning] = useState(false);
  const [modalProd, setModalProd] = useState(null);
  const [desconto, setDesconto] = useState(0);
  const [confirmar, setConfirmar] = useState(false);

  const prodsFiltrados = produtos.filter(p=>p.ativo && p.estoque>0 &&
    (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
     p.id.toLowerCase().includes(busca.toLowerCase()) ||
     p.cat.toLowerCase().includes(busca.toLowerCase())));

  const addCarrinho = (prod) => {
    const ex = carrinho.find(i=>i.id===prod.id);
    if (ex) {
      if (ex.qtd >= prod.estoque) { toast("Estoque insuficiente","error"); return; }
      setCarrinho(c=>c.map(i=>i.id===prod.id?{...i,qtd:i.qtd+1}:i));
    } else {
      setCarrinho(c=>[...c,{...prod,qtd:1}]);
    }
    setBusca("");
  };

  const removeCarrinho = (id) => setCarrinho(c=>c.filter(i=>i.id!==id));
  const subtotal = carrinho.reduce((a,i)=>a+i.preco*i.qtd,0);
  const total = Math.max(0, subtotal - Number(desconto));

  const finalizarVenda = () => {
    if (!carrinho.length) return;
    const venda = {
      id: genId(), data: hoje(), hora: agora(),
      vendedora: usuario.nome, forma,
      itens: carrinho.map(i=>({...i})),
      subtotal, desconto: Number(desconto), total,
    };
    onVenda(venda);
    setCarrinho([]); setDesconto(0); setConfirmar(false);
    toast("Venda registrada com sucesso!");
  };

  const simularScan = () => {
    setScanning(true);
    setTimeout(()=>{
      const p = produtos.filter(p=>p.ativo&&p.estoque>0);
      if (p.length) addCarrinho(p[Math.floor(Math.random()*p.length)]);
      setScanning(false);
      toast("QR Code lido com sucesso!");
    }, 1200);
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,height:"calc(100vh - 80px)"}}>
      {/* Esquerda — busca e produtos */}
      <div style={{display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}>
            <Input value={busca} onChange={setBusca} placeholder="🔍  Buscar produto por nome, código ou categoria..."/>
          </div>
          <Btn onClick={simularScan} color={scanning?C.yellow:C.blue}>
            {scanning?"📡 Lendo...":"📷 Escanear QR"}
          </Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
          {prodsFiltrados.map(p=>(
            <div key={p.id} onClick={()=>addCarrinho(p)} style={{
              background:C.card,border:`1px solid ${C.border}`,borderRadius:12,
              padding:12,cursor:"pointer",transition:"border-color 0.15s",
            }}
            onMouseOver={e=>e.currentTarget.style.borderColor=C.g2}
            onMouseOut={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{fontSize:28,textAlign:"center",marginBottom:6}}>{p.foto}</div>
              <p style={{margin:0,fontSize:11,fontWeight:700,color:C.text,lineHeight:1.3}}>{p.nome}</p>
              <p style={{margin:"2px 0",fontSize:10,color:C.dim}}>{p.cat} · {p.tam}</p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
                <span style={{fontSize:14,fontWeight:900,color:C.g1}}>{fmtR(p.preco)}</span>
                <Badge label={`${p.estoque} un`} color={p.estoque<=3?C.red:C.g2}/>
              </div>
            </div>
          ))}
          {prodsFiltrados.length===0&&<p style={{color:C.dim,fontSize:13,gridColumn:"1/-1",textAlign:"center",padding:24}}>Nenhum produto encontrado</p>}
        </div>
      </div>

      {/* Direita — carrinho */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{flex:1,overflowY:"auto"}}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:C.g1}}>🛒 CARRINHO</p>
          {carrinho.length===0 && <p style={{color:C.dim,fontSize:12,textAlign:"center",padding:20}}>Escaneie ou selecione um produto</p>}
          {carrinho.map(i=>(
            <div key={i.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:20}}>{i.foto}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.nome}</p>
                <p style={{margin:0,fontSize:10,color:C.dim}}>{i.qtd}x {fmtR(i.preco)}</p>
              </div>
              <span style={{fontSize:12,fontWeight:800,color:C.g1,flexShrink:0}}>{fmtR(i.preco*i.qtd)}</span>
              <button onClick={()=>removeCarrinho(i.id)} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          ))}
        </Card>

        <Card>
          <Select label="Forma de Pagamento" value={forma} onChange={setForma}
            options={["PIX","Dinheiro","Crédito","Débito"]}/>
          <Input label="Desconto (R$)" value={desconto} onChange={setDesconto} type="number" small/>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:C.dim,fontSize:12}}>Subtotal</span>
              <span style={{color:C.sub,fontSize:12}}>{fmtR(subtotal)}</span>
            </div>
            {Number(desconto)>0 && <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:C.red,fontSize:12}}>Desconto</span>
              <span style={{color:C.red,fontSize:12}}>- {fmtR(desconto)}</span>
            </div>}
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <span style={{color:C.text,fontWeight:800,fontSize:15}}>TOTAL</span>
              <span style={{color:C.g1,fontWeight:900,fontSize:18}}>{fmtR(total)}</span>
            </div>
            <Btn full onClick={()=>setConfirmar(true)} disabled={!carrinho.length} color={C.g2}>
              ✅ FINALIZAR VENDA
            </Btn>
          </div>
        </Card>
      </div>

      {/* Modal confirmação */}
      {confirmar && <Modal title="Confirmar Venda" onClose={()=>setConfirmar(false)}>
        <div style={{marginBottom:16}}>
          {carrinho.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
            <span style={{color:C.text}}>{i.qtd}x {i.nome}</span>
            <span style={{color:C.g1,fontWeight:700}}>{fmtR(i.preco*i.qtd)}</span>
          </div>)}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:900}}>
            <span style={{color:C.text}}>TOTAL</span>
            <span style={{color:C.g1}}>{fmtR(total)}</span>
          </div>
          <p style={{color:C.sub,fontSize:12,textAlign:"center"}}>Forma: {forma} · Vendedora: {usuario.nome}</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn full outline color={C.red} onClick={()=>setConfirmar(false)}>Cancelar</Btn>
          <Btn full onClick={finalizarVenda} color={C.g2}>Confirmar</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ─── VERIFICAÇÃO DE PREÇO ─────────────────────────────────────────
function TelaPreco({produtos}) {
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState(null);
  const [scanning, setScanning] = useState(false);

  const buscar = () => {
    const p = produtos.find(p=>p.ativo&&(
      p.nome.toLowerCase().includes(busca.toLowerCase())||
      p.id.toLowerCase()===busca.toLowerCase()
    ));
    setResultado(p||false);
  };

  const simScan = () => {
    setScanning(true);
    setTimeout(()=>{
      const p = produtos.filter(p=>p.ativo);
      if(p.length) setResultado(p[Math.floor(Math.random()*p.length)]);
      setScanning(false);
    },1200);
  };

  return (
    <div style={{maxWidth:500,margin:"0 auto"}}>
      <Card style={{marginBottom:16}}>
        <p style={{margin:"0 0 14px",fontSize:14,fontWeight:800,color:C.g1}}>🔍 VERIFICAR PREÇO</p>
        <Input value={busca} onChange={setBusca} placeholder="Digite o nome ou código do produto..."/>
        <div style={{display:"flex",gap:10}}>
          <Btn full onClick={buscar} color={C.g2}>Buscar</Btn>
          <Btn onClick={simScan} color={C.blue}>{scanning?"📡...":"📷 QR Code"}</Btn>
        </div>
      </Card>

      {resultado===false && <Card><p style={{color:C.red,textAlign:"center",fontSize:14}}>❌ Produto não encontrado</p></Card>}
      {resultado && (
        <Card>
          <div style={{textAlign:"center",padding:"10px 0 16px"}}>
            <div style={{fontSize:56,marginBottom:8}}>{resultado.foto}</div>
            <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:900}}>{resultado.nome}</h2>
            <p style={{margin:"4px 0 0",color:C.dim,fontSize:13}}>{resultado.cat} · Tam: {resultado.tam} · Cor: {resultado.cor}</p>
            <div style={{fontSize:40,fontWeight:900,color:C.g1,margin:"16px 0"}}>{fmtR(resultado.preco)}</div>
            <Badge label={resultado.estoque>0?"Disponível":"Sem estoque"} color={resultado.estoque>0?C.g2:C.red}/>
            <div style={{marginTop:16}}>
              <QRCodeVisual data={gerarQRData(resultado)} size={100}/>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── GERADOR DE QR CODE E CÓDIGO DE BARRAS ───────────────────────
function TelaEtiquetas({produtos}) {
  const [sel, setSel] = useState("");
  const [tipo, setTipo] = useState("qr");
  const prod = produtos.find(p=>p.id===sel);

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <p style={{margin:"0 0 14px",fontSize:13,fontWeight:800,color:C.g1}}>⚙️ CONFIGURAR ETIQUETA</p>
        <Select label="Produto" value={sel} onChange={setSel}
          options={[{value:"",label:"-- Selecione --"},...produtos.filter(p=>p.ativo).map(p=>({value:p.id,label:p.nome}))]}/>
        <Select label="Tipo de Código" value={tipo} onChange={setTipo}
          options={[{value:"qr",label:"QR Code"},{value:"barras",label:"Código de Barras"},{value:"ambos",label:"QR Code + Barras"}]}/>
        {prod && (
          <div style={{marginTop:12}}>
            <p style={{fontSize:11,color:C.sub,fontWeight:700,margin:"0 0 6px",textTransform:"uppercase"}}>Produto selecionado</p>
            <div style={{background:C.surface,borderRadius:10,padding:12}}>
              <p style={{margin:0,fontSize:13,fontWeight:800,color:C.text}}>{prod.nome}</p>
              <p style={{margin:"2px 0 0",fontSize:11,color:C.dim}}>{prod.cat} · {prod.tam} · {prod.cor}</p>
              <p style={{margin:"6px 0 0",fontSize:16,fontWeight:900,color:C.g1}}>{fmtR(prod.preco)}</p>
            </div>
          </div>
        )}
      </Card>

      <Card style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300}}>
        {!prod ? (
          <p style={{color:C.dim,fontSize:13}}>Selecione um produto para gerar o código</p>
        ) : (
          <div style={{textAlign:"center"}}>
            <div style={{background:"#fff",padding:16,borderRadius:12,marginBottom:12,display:"inline-block"}}>
              <div style={{fontSize:28,marginBottom:6}}>{prod.foto}</div>
              <p style={{margin:"0 0 4px",fontSize:10,fontWeight:800,color:"#000",fontFamily:"monospace"}}>{prod.id}</p>
              <p style={{margin:"0 0 8px",fontSize:9,color:"#333",maxWidth:150,lineHeight:1.3}}>{prod.nome}</p>
              {(tipo==="qr"||tipo==="ambos") && <div style={{marginBottom:8}}><QRCodeVisual data={gerarQRData(prod)} size={100}/></div>}
              {(tipo==="barras"||tipo==="ambos") && <div><BarcodeVisual code={prod.id} width={150} height={40}/></div>}
              <p style={{margin:"8px 0 0",fontSize:13,fontWeight:900,color:"#000"}}>{fmtR(prod.preco)}</p>
              <p style={{margin:"2px 0 0",fontSize:9,color:"#555"}}>Tam: {prod.tam} · {prod.cor}</p>
            </div>
            <p style={{color:C.dim,fontSize:11,marginTop:8}}>Use Ctrl+P para imprimir</p>
            <Btn small color={C.g2} onClick={()=>window.print()}>🖨️ Imprimir Etiqueta</Btn>
          </div>
        )}
      </Card>

      {/* Grade de múltiplos produtos */}
      <div style={{gridColumn:"1/-1"}}>
        <Card>
          <p style={{margin:"0 0 14px",fontSize:13,fontWeight:800,color:C.g1}}>📋 TODOS OS PRODUTOS — Etiquetas em Lote</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
            {produtos.filter(p=>p.ativo).map(p=>(
              <div key={p.id} style={{background:"#fff",borderRadius:10,padding:12,textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:22,marginBottom:4}}>{p.foto}</div>
                <p style={{margin:0,fontSize:9,fontWeight:800,color:"#000",fontFamily:"monospace"}}>{p.id}</p>
                <p style={{margin:"2px 0",fontSize:9,color:"#333",lineHeight:1.2}}>{p.nome}</p>
                <QRCodeVisual data={gerarQRData(p)} size={70}/>
                <p style={{margin:"4px 0 0",fontSize:12,fontWeight:900,color:"#000"}}>{fmtR(p.preco)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── ESTOQUE ──────────────────────────────────────────────────────
function TelaEstoque({produtos, setProdutos, toast}) {
  const [modalNovo, setModalNovo] = useState(false);
  const [modalEdit, setModalEdit] = useState(null);
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState({nome:"",cat:"Infantil Feminino",tam:"",cor:"",custo:0,preco:0,estoque:0,foto:"👗"});

  const CATS = ["Bebê/Infantil","Infantil Feminino","Infantil Masculino","Juvenil Feminino","Juvenil Masculino","Adulto","Acessórios","Fantasias","Calçados"];
  const FOTOS = ["👗","👕","👖","🧥","👒","🧢","👟","🌙","💃","🕷️","👶","🎀"];

  const filtrados = produtos.filter(p=>
    p.nome.toLowerCase().includes(busca.toLowerCase())||
    p.cat.toLowerCase().includes(busca.toLowerCase())||
    p.id.toLowerCase().includes(busca.toLowerCase())
  );

  const salvarNovo = () => {
    if (!novo.nome) { toast("Preencha o nome do produto","error"); return; }
    const p = {...novo, id:"P"+String(produtos.length+1).padStart(3,"0"), ativo:true,
      custo:Number(novo.custo), preco:Number(novo.preco), estoque:Number(novo.estoque)};
    setProdutos(prev=>[...prev,p]);
    setModalNovo(false);
    setNovo({nome:"",cat:"Infantil Feminino",tam:"",cor:"",custo:0,preco:0,estoque:0,foto:"👗"});
    toast("Produto cadastrado com sucesso!");
  };

  const salvarEdit = () => {
    setProdutos(prev=>prev.map(p=>p.id===modalEdit.id?{...modalEdit,custo:Number(modalEdit.custo),preco:Number(modalEdit.preco),estoque:Number(modalEdit.estoque)}:p));
    setModalEdit(null);
    toast("Produto atualizado!");
  };

  const toggleAtivo = (id) => {
    setProdutos(prev=>prev.map(p=>p.id===id?{...p,ativo:!p.ativo}:p));
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <div style={{flex:1}}><Input value={busca} onChange={setBusca} placeholder="🔍 Buscar produto..."/></div>
        <Btn color={C.g2} onClick={()=>setModalNovo(true)}>+ Novo Produto</Btn>
      </div>

      {/* Alertas de estoque baixo */}
      {produtos.filter(p=>p.ativo&&p.estoque<=3).length>0 && (
        <Card style={{borderColor:C.red}}>
          <p style={{margin:"0 0 8px",color:C.red,fontWeight:800,fontSize:13}}>⚠️ Estoque Baixo</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {produtos.filter(p=>p.ativo&&p.estoque<=3).map(p=>(
              <Badge key={p.id} label={`${p.foto} ${p.nome} — ${p.estoque} un`} color={p.estoque===0?C.red:C.orange}/>
            ))}
          </div>
        </Card>
      )}

      {/* Tabela de produtos */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:C.surface}}>
                {["","Código","Produto","Categoria","Tam","Preço","Custo","Estoque","Status","Ações"].map((h,i)=>(
                  <th key={i} style={{padding:"10px 12px",textAlign:i<2?"center":"left",color:C.g1,fontWeight:800,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p,i)=>(
                <tr key={p.id} style={{background:i%2===0?"transparent":C.surface+"44",opacity:p.ativo?1:0.4}}>
                  <td style={{padding:"8px 12px",textAlign:"center",fontSize:20}}>{p.foto}</td>
                  <td style={{padding:"8px 12px",color:C.dim,fontFamily:"monospace",fontSize:11}}>{p.id}</td>
                  <td style={{padding:"8px 12px",color:C.text,fontWeight:600}}>{p.nome}</td>
                  <td style={{padding:"8px 12px",color:C.dim}}>{p.cat}</td>
                  <td style={{padding:"8px 12px",color:C.dim}}>{p.tam}</td>
                  <td style={{padding:"8px 12px",color:C.g1,fontWeight:800}}>{fmtR(p.preco)}</td>
                  <td style={{padding:"8px 12px",color:C.dim}}>{fmtR(p.custo)}</td>
                  <td style={{padding:"8px 12px"}}>
                    <Badge label={p.estoque+" un"} color={p.estoque===0?C.red:p.estoque<=3?C.orange:C.g2}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <Badge label={p.ativo?"Ativo":"Inativo"} color={p.ativo?C.g2:C.dim}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>setModalEdit({...p})} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",color:C.blue,fontSize:11,cursor:"pointer"}}>✏️</button>
                      <button onClick={()=>toggleAtivo(p.id)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",color:p.ativo?C.red:C.g2,fontSize:11,cursor:"pointer"}}>{p.ativo?"🚫":"✅"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal novo produto */}
      {modalNovo && <Modal title="Cadastrar Novo Produto" onClose={()=>setModalNovo(false)} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><Input label="Nome do Produto" value={novo.nome} onChange={v=>setNovo({...novo,nome:v})} placeholder="Ex: Vestido Clariza Fenda"/></div>
          <Select label="Categoria" value={novo.cat} onChange={v=>setNovo({...novo,cat:v})} options={CATS}/>
          <Input label="Tamanho" value={novo.tam} onChange={v=>setNovo({...novo,tam:v})} placeholder="Ex: 8 anos, M, Único"/>
          <Input label="Cor" value={novo.cor} onChange={v=>setNovo({...novo,cor:v})} placeholder="Ex: Rosa, Azul"/>
          <div>
            <p style={{margin:"0 0 6px",fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase"}}>Ícone</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {FOTOS.map(f=><button key={f} onClick={()=>setNovo({...novo,foto:f})} style={{fontSize:20,padding:4,background:novo.foto===f?C.g2+"33":"transparent",border:`1px solid ${novo.foto===f?C.g2:C.border}`,borderRadius:6,cursor:"pointer"}}>{f}</button>)}
            </div>
          </div>
          <Input label="Estoque inicial" value={novo.estoque} onChange={v=>setNovo({...novo,estoque:v})} type="number"/>
          <Input label="Preço de Custo (R$)" value={novo.custo} onChange={v=>setNovo({...novo,custo:v})} type="number"/>
          <Input label="Preço de Venda (R$)" value={novo.preco} onChange={v=>setNovo({...novo,preco:v})} type="number"/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <Btn full outline color={C.dim} onClick={()=>setModalNovo(false)}>Cancelar</Btn>
          <Btn full color={C.g2} onClick={salvarNovo}>Salvar Produto</Btn>
        </div>
      </Modal>}

      {/* Modal editar produto */}
      {modalEdit && <Modal title={`Editar — ${modalEdit.nome}`} onClose={()=>setModalEdit(null)} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}><Input label="Nome" value={modalEdit.nome} onChange={v=>setModalEdit({...modalEdit,nome:v})}/></div>
          <Select label="Categoria" value={modalEdit.cat} onChange={v=>setModalEdit({...modalEdit,cat:v})} options={CATS}/>
          <Input label="Tamanho" value={modalEdit.tam} onChange={v=>setModalEdit({...modalEdit,tam:v})}/>
          <Input label="Preço de Custo" value={modalEdit.custo} onChange={v=>setModalEdit({...modalEdit,custo:v})} type="number"/>
          <Input label="Preço de Venda" value={modalEdit.preco} onChange={v=>setModalEdit({...modalEdit,preco:v})} type="number"/>
          <Input label="Estoque atual" value={modalEdit.estoque} onChange={v=>setModalEdit({...modalEdit,estoque:v})} type="number"/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <Btn full outline color={C.dim} onClick={()=>setModalEdit(null)}>Cancelar</Btn>
          <Btn full color={C.g2} onClick={salvarEdit}>Salvar Alterações</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ─── HISTÓRICO DE VENDAS ──────────────────────────────────────────
function TelaHistorico({vendas, usuario}) {
  const minhas = usuario.perfil==="vendedora" ? vendas.filter(v=>v.vendedora===usuario.nome) : vendas;
  const total = minhas.reduce((a,v)=>a+v.total,0);
  const [detalhes, setDetalhes] = useState(null);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {usuario.perfil==="adm" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
          {[
            {icon:"💰",label:"Total do Dia",val:fmtR(total),color:C.g1},
            {icon:"🛍️",label:"Vendas",val:minhas.length,color:C.blue},
            {icon:"💳",label:"PIX",val:fmtR(minhas.filter(v=>v.forma==="PIX").reduce((a,v)=>a+v.total,0)),color:C.g2},
            {icon:"💵",label:"Dinheiro",val:fmtR(minhas.filter(v=>v.forma==="Dinheiro").reduce((a,v)=>a+v.total,0)),color:C.yellow},
          ].map((k,i)=>(
            <Card key={i}>
              <p style={{margin:0,fontSize:10,color:C.dim,fontWeight:700,textTransform:"uppercase"}}>{k.icon} {k.label}</p>
              <p style={{margin:"4px 0 0",fontSize:20,fontWeight:900,color:k.color}}>{k.val}</p>
            </Card>
          ))}
        </div>
      )}

      {minhas.length===0 && <Card><p style={{color:C.dim,textAlign:"center",padding:20}}>Nenhuma venda registrada ainda</p></Card>}

      {minhas.map(v=>(
        <Card key={v.id} style={{cursor:"pointer"}} onClick={()=>setDetalhes(v)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{margin:0,fontSize:13,fontWeight:800,color:C.text}}>Venda #{v.id}</p>
              <p style={{margin:"2px 0 0",fontSize:11,color:C.dim}}>{v.data} às {v.hora} · {v.vendedora} · {v.forma}</p>
              <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>
                {v.itens.map((it,i)=><Badge key={i} label={`${it.qtd}x ${it.nome}`} color={C.g3}/>)}
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
              <p style={{margin:0,fontSize:18,fontWeight:900,color:C.g1}}>{fmtR(v.total)}</p>
              {v.desconto>0 && <p style={{margin:"2px 0 0",fontSize:10,color:C.red}}>-{fmtR(v.desconto)}</p>}
            </div>
          </div>
        </Card>
      ))}

      {detalhes && <Modal title={`Venda #${detalhes.id}`} onClose={()=>setDetalhes(null)}>
        <p style={{color:C.dim,fontSize:12,margin:"0 0 14px"}}>{detalhes.data} às {detalhes.hora} · {detalhes.vendedora} · {detalhes.forma}</p>
        {detalhes.itens.map((it,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
            <span style={{color:C.text}}>{it.foto} {it.qtd}x {it.nome}</span>
            <span style={{color:C.g1,fontWeight:700}}>{fmtR(it.preco*it.qtd)}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0 0",fontSize:16,fontWeight:900}}>
          <span style={{color:C.text}}>TOTAL</span>
          <span style={{color:C.g1}}>{fmtR(detalhes.total)}</span>
        </div>
      </Modal>}
    </div>
  );
}

// ─── DASHBOARD ADM ────────────────────────────────────────────────
function TelaDashboard({vendas, produtos}) {
  const totalFat = vendas.reduce((a,v)=>a+v.total,0);
  const totalCMV = vendas.flatMap(v=>v.itens).reduce((a,i)=>a+(i.custo||0)*i.qtd,0);
  const lucro = totalFat - totalCMV;
  const margem = totalFat ? (lucro/totalFat*100).toFixed(1) : 0;

  const porForma = {};
  vendas.forEach(v=>{porForma[v.forma]=(porForma[v.forma]||0)+v.total;});

  const porProd = {};
  vendas.flatMap(v=>v.itens).forEach(i=>{
    porProd[i.nome]=(porProd[i.nome]||{nome:i.nome,fat:0,qtd:0});
    porProd[i.nome].fat+=i.preco*i.qtd;
    porProd[i.nome].qtd+=i.qtd;
  });
  const ranking = Object.values(porProd).sort((a,b)=>b.fat-a.fat).slice(0,5);

  const semEstoque = produtos.filter(p=>p.ativo&&p.estoque===0);
  const estoqueB = produtos.filter(p=>p.ativo&&p.estoque>0&&p.estoque<=3);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
        {[
          {icon:"💰",label:"Faturamento",val:fmtR(totalFat),color:C.g1},
          {icon:"📦",label:"CMV",val:fmtR(totalCMV),color:C.orange},
          {icon:"📈",label:"Lucro",val:fmtR(lucro),color:C.blue},
          {icon:"📊",label:"Margem",val:margem+"%",color:lucro>0?C.g2:C.red},
          {icon:"🛍️",label:"Vendas",val:vendas.length,color:C.g1},
          {icon:"📋",label:"Produtos",val:produtos.filter(p=>p.ativo).length+" ativos",color:C.sub},
        ].map((k,i)=>(
          <Card key={i}>
            <p style={{margin:0,fontSize:10,color:C.dim,fontWeight:700,textTransform:"uppercase"}}>{k.icon} {k.label}</p>
            <p style={{margin:"4px 0 0",fontSize:20,fontWeight:900,color:k.color}}>{k.val}</p>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Ranking */}
        <Card>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:C.g1}}>🏆 Top Produtos</p>
          {ranking.length===0 && <p style={{color:C.dim,fontSize:12}}>Sem vendas ainda</p>}
          {ranking.map((r,i)=>{
            const medals=["🥇","🥈","🥉","4º","5º"];
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:14,width:24}}>{medals[i]}</span>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{r.nome}</p>
                  <div style={{background:C.surface,borderRadius:4,height:5,marginTop:3}}>
                    <div style={{width:`${ranking[0].fat?(r.fat/ranking[0].fat*100):0}%`,height:"100%",background:C.g2,borderRadius:4}}/>
                  </div>
                </div>
                <span style={{fontSize:11,color:C.g1,fontWeight:800,flexShrink:0}}>{fmtR(r.fat)}</span>
              </div>
            );
          })}
        </Card>

        {/* Pagamentos */}
        <Card>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:C.g1}}>💳 Por Forma de Pgto.</p>
          {Object.entries(porForma).length===0 && <p style={{color:C.dim,fontSize:12}}>Sem vendas ainda</p>}
          {Object.entries(porForma).map(([k,v])=>{
            const colors={PIX:C.g2,Dinheiro:C.yellow,Crédito:C.blue,Débito:C.orange};
            const pct = totalFat?(v/totalFat*100).toFixed(1):0;
            return (
              <div key={k} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                  <span style={{color:C.text,fontWeight:700}}>{k}</span>
                  <span style={{color:C.dim}}>{fmtR(v)} ({pct}%)</span>
                </div>
                <div style={{background:C.surface,borderRadius:6,height:8}}>
                  <div style={{width:`${pct}%`,height:"100%",background:colors[k]||C.g2,borderRadius:6}}/>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Alertas */}
      {(semEstoque.length>0||estoqueB.length>0) && (
        <Card style={{borderColor:C.red}}>
          <p style={{margin:"0 0 10px",color:C.red,fontWeight:800,fontSize:13}}>🚨 Alertas de Estoque</p>
          {semEstoque.length>0&&<div style={{marginBottom:8}}><p style={{margin:"0 0 4px",fontSize:11,color:C.red}}>SEM ESTOQUE:</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{semEstoque.map(p=><Badge key={p.id} label={`${p.foto} ${p.nome}`} color={C.red}/>)}</div></div>}
          {estoqueB.length>0&&<div><p style={{margin:"0 0 4px",fontSize:11,color:C.orange}}>ESTOQUE BAIXO (≤3):</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{estoqueB.map(p=><Badge key={p.id} label={`${p.foto} ${p.nome} — ${p.estoque} un`} color={C.orange}/>)}</div></div>}
        </Card>
      )}

      {/* DRE */}
      <Card>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:C.g1}}>📄 DRE Simplificado</p>
        {[
          ["RECEITA BRUTA",fmtR(totalFat),true,C.g1],
          ["(−) CMV — Custo de Mercadoria",fmtR(totalCMV),false,C.dim],
          ["= LUCRO BRUTO",fmtR(lucro),true,lucro>=0?C.g1:C.red],
          ["Margem bruta",margem+"%",false,C.sub],
        ].map(([label,val,bold,color],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}22`}}>
            <span style={{fontSize:13,fontWeight:bold?800:400,color:bold?C.text:C.dim}}>{label}</span>
            <span style={{fontSize:13,fontWeight:bold?800:400,color}}>{val}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────
const MENUS_ADM = [
  {key:"dashboard",icon:"📊",label:"Dashboard"},
  {key:"pdv",icon:"🛒",label:"PDV / Venda"},
  {key:"historico",icon:"📋",label:"Histórico"},
  {key:"estoque",icon:"📦",label:"Estoque"},
  {key:"etiquetas",icon:"🔖",label:"QR / Etiquetas"},
  {key:"preco",icon:"🔍",label:"Consulta Preço"},
];
const MENUS_VEND = [
  {key:"pdv",icon:"🛒",label:"PDV / Venda"},
  {key:"historico",icon:"📋",label:"Minhas Vendas"},
  {key:"preco",icon:"🔍",label:"Consulta Preço"},
  {key:"etiquetas",icon:"🔖",label:"QR Code"},
];

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState("pdv");
  const [produtos, setProdutos] = useState(PRODUTOS_INICIAL);
  const [vendas, setVendas] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = (msg, type="success") => {
    setToastMsg({msg,type});
    setTimeout(()=>setToastMsg(null),2800);
  };

  const onVenda = (venda) => {
    setVendas(prev=>[venda,...prev]);
    setProdutos(prev=>prev.map(p=>{
      const item = venda.itens.find(i=>i.id===p.id);
      return item ? {...p, estoque: Math.max(0,p.estoque-item.qtd)} : p;
    }));
  };

  if (!usuario) return <TelaLogin onLogin={u=>{setUsuario(u);setPagina(u.perfil==="adm"?"dashboard":"pdv");}}/>;

  const menus = usuario.perfil==="adm" ? MENUS_ADM : MENUS_VEND;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:"Georgia,'Times New Roman',serif",color:C.text}}>
      {/* SIDEBAR */}
      <div style={{width:200,background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"18px 14px 14px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:22}}>👗</span>
            <div>
              <p style={{margin:0,fontSize:13,fontWeight:900,color:C.g1,letterSpacing:"0.04em"}}>CLARIZA</p>
              <p style={{margin:0,fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em"}}>KIDS</p>
            </div>
          </div>
          <div style={{background:C.surface,borderRadius:8,padding:"6px 10px",marginTop:8}}>
            <p style={{margin:0,fontSize:10,color:C.g1,fontWeight:700}}>{usuario.nome}</p>
            <p style={{margin:0,fontSize:9,color:C.dim}}>{usuario.perfil==="adm"?"👑 Administrador":"👩 Vendedora"}</p>
          </div>
        </div>
        <div style={{padding:"10px 8px",flex:1}}>
          {menus.map(m=>(
            <button key={m.key} onClick={()=>setPagina(m.key)} style={{
              width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",
              borderRadius:10,border:"none",background:pagina===m.key?C.g2+"22":"transparent",
              cursor:"pointer",textAlign:"left",marginBottom:2,
            }}>
              <span style={{fontSize:16}}>{m.icon}</span>
              <span style={{fontSize:12,fontWeight:pagina===m.key?800:500,color:pagina===m.key?C.g1:C.sub}}>{m.label}</span>
              {pagina===m.key&&<div style={{marginLeft:"auto",width:3,height:14,background:C.g1,borderRadius:2}}/>}
            </button>
          ))}
        </div>
        <div style={{padding:"10px 14px 16px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>setUsuario(null)} style={{width:"100%",background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 0",color:C.dim,fontSize:11,cursor:"pointer",fontWeight:600}}>
            🚪 Sair
          </button>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        <div style={{marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <h1 style={{margin:0,fontSize:17,fontWeight:900,color:C.text}}>
              {menus.find(m=>m.key===pagina)?.icon} {menus.find(m=>m.key===pagina)?.label}
            </h1>
            <p style={{margin:"2px 0 0",fontSize:11,color:C.dim}}>Clariza Kids · {hoje()}</p>
          </div>
          {usuario.perfil==="adm" && (
            <Badge label={`${vendas.length} vendas · ${fmtR(vendas.reduce((a,v)=>a+v.total,0))}`} color={C.g1}/>
          )}
        </div>

        {pagina==="dashboard" && <TelaDashboard vendas={vendas} produtos={produtos}/>}
        {pagina==="pdv" && <TelaPDV usuario={usuario} produtos={produtos} onVenda={onVenda} toast={toast}/>}
        {pagina==="historico" && <TelaHistorico vendas={vendas} usuario={usuario}/>}
        {pagina==="estoque" && usuario.perfil==="adm" && <TelaEstoque produtos={produtos} setProdutos={setProdutos} toast={toast}/>}
        {pagina==="etiquetas" && <TelaEtiquetas produtos={produtos}/>}
        {pagina==="preco" && <TelaPreco produtos={produtos}/>}
      </div>

      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type}/>}
    </div>
  );
}
