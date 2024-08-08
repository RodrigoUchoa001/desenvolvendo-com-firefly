import FireFly from "@hyperledger/firefly-sdk";
import fastify from "fastify";

const app = fastify();

interface Body{
    msg: string
    nome: string,
    eFungivel: boolean
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


app.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log("servidor rodando em http://localhost:3333");
})