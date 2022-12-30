import SideMenu from "./SideMenu.vue";

describe("SideMenu", () => {
  it("renders", () => {
    cy.mount(
      <SideMenu
        selected="dependencies"
        items={["dependencies", "notifications", "account"]}
      />
    );
  });
});
