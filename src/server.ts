import FireFly from "@hyperledger/firefly-sdk";
import fastify from "fastify";

const app = fastify();

app.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log("servidor rodando em http://localhost:3333");
})