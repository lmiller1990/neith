import type { GetDependency } from "../../../server/models/registry";
import DependencyForm from "./DependencyForm.vue";

const trpcResponse: GetDependency = {
  name: "vite",
  description: "Native-ESM powered web dev build tool",
  tags: [
    { name: "latest", tag: "4.0.3", published: "2022-12-21T13:43:00.084Z" },
    {
      name: "beta",
      tag: "4.0.0-beta.7",
      published: "2022-12-08T22:34:44.406Z",
    },
    {
      name: "alpha",
      tag: "4.0.0-alpha.6",
      published: "2022-11-30T16:54:51.503Z",
    },
  ],
};

describe("<DependencyForm />", () => {
  it("renders", () => {
    cy.intercept("http://localhost:4444/trpc/getDependencies*", {
      body: [
        {
          result: {
            data: trpcResponse,
          },
        },
      ],
    });

    cy.mount(() => (
      <div class="m-4">
        {/* @ts-ignore - dunno, figure it out */}
        <DependencyForm pkg={trpcResponse} />
      </div>
    ));
  });
});
