import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { Layout } from "./components/Layout";
import { ConfigProvider } from "./state/configStore";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>Tiled Workspace</Title>
          <ConfigProvider>
            <Layout>
              <Suspense>{props.children}</Suspense>
            </Layout>
          </ConfigProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
