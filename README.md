# Agendamento de Salas | Politécnico

Sistema completo para alocação, agendamento e gerenciamento de salas da instituição, construído com uma arquitetura moderna e totalmente conteinerizada utilizando NestJS, React e Docker.

Este projeto simplifica o processo de reserva de salas para os usuários e oferece um painel administrativo robusto para controle de blocos, usuários e aplicação de bloqueios/exceções temporárias em intervalos de datas.

## 🛠️ Tecnologias

* **Backend:** Node.js, NestJS, TypeScript, TypeORM
* **Frontend:** React, TypeScript, Vite, CSS Modules
* **Banco de Dados & Infra:** PostgreSQL, Docker, Docker Compose, pgAdmin 4



## 🚀 Como Iniciar

A grande vantagem da arquitetura atual é que **não é necessário instalar o Node.js, NestJS, React ou PostgreSQL na sua máquina física**. O Docker se encarrega de isolar e rodar todo o ambiente localmente, mantendo o *hot-reload* ativo (qualquer alteração no código refletirá instantaneamente).

### Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* **Docker** e **Docker Desktop** ativos e rodando.
* Um editor de código (como o **VS Code**).

---

### 1. Clonar o Repositório
```bash
git clone [https://github.com/thiagocalegaro/projeto-integrador](https://github.com/thiagocalegaro/projeto-integrador)
cd projeto-integrador
```


### 2. Executar o Ecossistema com Docker

Na raiz do projeto (onde se encontra o arquivo `docker-compose.yml`), execute o comando abaixo. Ele fará o *build* das imagens do Backend e Frontend, baixará o banco de dados e instalará as dependências internamente nos containers:

```bash
docker compose up -d --build

```

> ⏱️ *Nota: A primeira execução pode demorar alguns minutos pois o Docker estará baixando as imagens base e rodando o `npm install` internamente de forma isolada.*

---

### 🌐 Serviços Disponíveis

Assim que o processo terminar, todas as aplicações estarão integradas e rodando nos seguintes endereços:

* **Frontend (Interface Web):** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Backend (API REST):** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
* **pgAdmin 4 (Gerenciador do Banco):** [http://localhost:8080](https://www.google.com/search?q=http://localhost:8080)
* **Login:** `admin@politecnico.com`
* **Senha:** `root`



---

## 🛠️ Desenvolvimento e Alterações no Código

Os containers do Frontend e do Backend foram configurados utilizando **Volumes do Docker**. Isso significa que:

1. Você pode abrir o projeto no seu VS Code normalmente.
2. Ao alterar e salvar qualquer arquivo `.ts`, `.tsx` ou `.css`, o Docker identificará a mudança e atualizará a aplicação automaticamente em tempo real (*hot-reload*).

## 🛑 Como Encerrar as Aplicações

Para pausar todos os serviços e liberar as portas do seu computador sem perder os dados salvos no banco de dados, execute o comando abaixo na raiz do projeto:

```bash
docker compose down

```

Se por algum motivo você desejar apagar o banco de dados local para reiniciar os testes do zero, execute:

```bash
docker compose down -v

```

## 👨‍💻 Autor

**Thiago Calegaro**

* GitHub: [@thiagocalegaro](https://github.com/thiagocalegaro)