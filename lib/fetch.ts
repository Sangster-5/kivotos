async function postRequest(url: string, body: Object): Promise<any> {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return await res.json();
}

async function getRequest(url: string): Promise<any> {
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    });
    return await res.json();
}

export { postRequest, getRequest };