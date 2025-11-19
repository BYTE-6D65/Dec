export async function getAuthToken(): Promise<string> {
    // TODO: Integrate with DEC Identity OIDC flow
    // This should fetch a short-lived token from the backend or identity provider
    console.log("Fetching OIDC token...");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("mock-oidc-token-" + Date.now());
        }, 500);
    });
}
