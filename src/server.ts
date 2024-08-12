import FireFly from "@hyperledger/firefly-sdk";
import fastify from "fastify";

const app = fastify();

interface Body{
    msg: string
    nome: string,
    eFungivel: boolean,
    quantidade: string,
    destinatario: string,
    carteiraDestinatario: string,
}

app.post("/enviar-msg", async (req, res) => {
    const { msg } = req.body as Body;

    const pessoa1 = new FireFly({ host: 'http://localhost:5000', namespace: 'default' });

    const message = await pessoa1.sendBroadcast({
        header: {
        },
        data: [
            { 
                value: msg
            },
            ],
        });
        return { type: 'message', id: message.header.id };
})

app.get("/listar-msgs", async (req,res) => {
    const pessoa2 = new FireFly({ host: 'http://localhost:5001', namespace: 'default' });

    const msgs = await pessoa2.getMessages();
    const conteudoMsg = await pessoa2.getData(msgs[0].data[0].id!);

    return res.send(conteudoMsg);
})

app.post("/criar-pool", async (req, res) => {
    const pessoa1 = new FireFly({ host: 'http://localhost:5000', namespace: 'default' });

    const { nome, eFungivel } = req.body as Body;


    const pool = await pessoa1.createTokenPool({
        name: nome,
        type: eFungivel ? 'fungible' : 'nonfungible',
        }, { publish: true });
    
    return { type: 'token_pool', id: pool.id };
})

app.post("/mintar-token", async (req, res) => {
    const pessoa1 = new FireFly({ host: 'http://localhost:5000', namespace: 'default' });

    const { nome, quantidade } = req.body as Body;

    const transfer = await pessoa1.mintTokens({
        pool: nome,
        amount: quantidade,
    });
        return { type: 'token_transfer', id: transfer.localId };
})

app.post("/transferir-token", async (req, res) => {
    const pessoa1 = new FireFly({ host: 'http://localhost:5000', namespace: 'default' });

    const { nome, quantidade, carteiraDestinatario } = req.body as Body;

    const transfer = await pessoa1.transferTokens({
        pool: nome,
        to: carteiraDestinatario,
        amount: quantidade,
      });
    return { type: 'token_transfer', id: transfer.localId };
})

// usando essa rota, invés de você passar o endereço da carteira ethereum diretamente,
// você passa o "did". A função automaticamente irá procurar pelo membro que tem esse "did",
// e então, resgatará o endereço da carteira dessa pessoa, enviando o token a mesma.
app.post("/transferir-token-complexo", async (req, res) => {
    const pessoa1 = new FireFly({ host: 'http://localhost:5000', namespace: 'default' });

    const { nome, quantidade, destinatario } = req.body as Body;

    const identidades = await pessoa1.getIdentities({
        fetchverifiers: 'true'
    });

    let carteiraDestinatario;
    identidades.forEach((identidade) => {
        if (identidade.did == destinatario){
            carteiraDestinatario = identidade.verifiers![0].value;
            console.log(identidade.did);
        }
    });

    const transfer = await pessoa1.transferTokens({
        pool: nome,
        to: carteiraDestinatario,
        amount: quantidade,
      });
    return { type: 'token_transfer', id: transfer.localId };
})


app.post("/queimar-token", async (req, res) => {
    const pessoa2 = new FireFly({ host: 'http://localhost:5001', namespace: 'default' });

    const { nome, quantidade } = req.body as Body;

    const burn = await pessoa2.burnTokens({
        pool: nome,
        amount: quantidade,
      });
    return { type: 'token_transfer', id: burn.localId };
})

app.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log("servidor rodando em http://localhost:3333");
})