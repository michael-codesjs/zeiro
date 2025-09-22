export type CREATE_USER_COMMAND = {
    source: "zeiro.services.cognito.confirmSignUp",
    name: "CREATE_USER",
    payload: {
        email: string,
        name: string,
        id: string,
        usage_intent: string,
        role: string,
        invitation_token?: string
    }
}