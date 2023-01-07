import SideMenu from "./SideMenu.vue";
const items = [
  {
    href: "/",
    name: "dependencies",
  },
  {
    href: "/notifications",
    name: "notifications",
  },
  {
    href: "/account",
    name: "account",
  },
];
describe("SideMenu", () => {
  it("renders", () => {
    cy.mount(<SideMenu selected="dependencies" items={items} />)
      .get('[data-cy-selected="true"]')
      .contains("dependencies");
  });
});
