import styles from "../styles/Home.module.css";
import { Form, Input, Button, message, Layout } from "antd";

const { Header, Content, Footer } = Layout;

export default function Home() {
  const onFinish = (values: any) => {
    const client = new WebSocket("ws://localhost:8080");
    client.addEventListener("open", (_) => {
      client.send(
        JSON.stringify({
          type: "registration",
          ...values,
        })
      );
    });
    client.addEventListener("message", (msg) => {
      const data = JSON.parse(msg.data);
      if (data.status) message.success(data.message);
      else message.error(data.message);
      client.close();
    });
  };

  return (
    <Layout>
      <Header className="header" />
      <Content className={styles.contents}>
        <Layout className={styles.container} style={{ padding: "24px 0" }}>
          <Form
            className={styles.form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email address!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Register
              </Button>
            </Form.Item>
          </Form>
        </Layout>
      </Content>
      <Footer style={{ textAlign: "center" }} />
    </Layout>
  );
}
