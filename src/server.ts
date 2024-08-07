import FireFly from "@hyperledger/firefly-sdk";
import fastify from "fastify";

const app = fastify();

interface Body{
    msg: string
}

app.post("/enviar-msg", async (req, res) => {
    const { msg } = req.body as Body;

    const aluno = new FireFly({ host: 'http://localhost:5000', namespace: 'default' });

    const message = await aluno.sendBroadcast({
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
    const professor = new FireFly({ host: 'http://localhost:5001', namespace: 'default' });

    const msgs = await professor.getMessages();
    const conteudoMsg = await professor.getData(msgs[0].data[0].id!);

    return res.send(conteudoMsg);

})

app.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log("servidor rodando em http://localhost:3333");
})