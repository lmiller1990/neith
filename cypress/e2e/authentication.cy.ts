describe("authentication", () => {
  beforeEach(() => {
    cy.task("stopServer");
    cy.task("scaffoldDatabase");
    cy.task("startServer");
  });

  it("signs up a new user", () => {
    cy.visit("/sign_up");
    cy.get('[name="email"]').type("test@test.com");
    cy.get('[name="organization"]').type("Test Org");
    cy.get('[name="password"]').type("password123");
    cy.get("button").contains("Sign Up").click();
    cy.url().should("equal", "http://localhost:4444/app");
  });

  it("fails to sign up due to duplicate credentials", () => {
    function signup() {
      cy.get('[name="email"]').type("test@test.com");
      cy.get('[name="organization"]').type("Test Org");
      cy.get('[name="password"]').type("password123");
      cy.get("button").contains("Sign Up").click();
    }
    cy.visit("/sign_up");
    signup();
    cy.url().should("equal", "http://localhost:4444/app");
    cy.visit("/sign_up");
    signup();
    cy.get('[role="alert"]').contains(
      "Organization with email test@test.com already exists."
    );
  });
});
