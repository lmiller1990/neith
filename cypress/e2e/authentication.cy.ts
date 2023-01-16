const rand = () => (Math.random() * 100000).toFixed();
function randomEmail() {
  return `${rand()}@${rand()}.com`;
}

function randomOrg() {
  return `Org #${rand()}`;
}

describe("authentication", () => {
  beforeEach(() => {
    cy.task("stopServer");
    cy.task("scaffoldDatabase");
    cy.task("startServer");
  });

  it("signs up a new user", () => {
    cy.visit("/");
    cy.get("a").contains("Sign Up").click();
    cy.get('[name="email"]').type(randomEmail());
    cy.get('[name="organization"]').type(randomOrg());
    cy.get('[name="password"]').type("password123");
    cy.get("button").contains("Submit").click();
    cy.url().should("equal", "http://localhost:4444/app");
  });

  it("fails to sign up due to duplicate credentials", () => {
    const email = randomEmail();
    function signup() {
      cy.get('[name="email"]').type(email);
      cy.get('[name="organization"]').type(randomOrg());
      cy.get('[name="password"]').type("password123");
      cy.get("button").contains("Submit").click();
    }
    cy.visit("/");
    cy.get("a").contains("Sign Up").click();
    signup();
    cy.url().should("equal", "http://localhost:4444/app");
    cy.visit("/sign_up");
    signup();
    cy.get('[role="alert"]').contains(
      `Organization with email ${email} already exists.`
    );
  });
});
