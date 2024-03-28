import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET_KEY: string;
  };
}>();

app.use("/api/v1/blog/*", async (c, next) => {
  const headers = c.req.header("authorization") || "";

  const token = headers.split(" ")[1];

  const verifiedToken = await verify(token, c.env.JWT_SECRET_KEY);

  await next();
});

app.get("/", (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  return c.text("Hello Hono!");
});

app.post("/api/v1/user/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    },
  });
  const token = await sign({ id: user.id }, c.env.JWT_SECRET_KEY);
  return c.json({ jwt: token });
});

app.post("/api/v1/user/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "User not found" });
  }

  const token = await sign({ id: user.id }, c.env.JWT_SECRET_KEY);
  return c.json({ jwt: token });
});

app.post("/api/v1/blog", (c) => {
  return c.text("Blog");
});

app.put("/api/v1/blog", (c) => {
  return c.text("Blog");
});

app.get("/api/v1/blog/", (c) => {
  return c.text("Blog");
});

app.post("/api/v1/blog/bulk", (c) => {
  return c.text("Blog");
});

export default app;
