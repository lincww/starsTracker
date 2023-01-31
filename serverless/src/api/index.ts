const router = (request: Request): Response => {
    const { pathname } = new URL(request.url)
    return new Response("test");
}

export {
    router
}