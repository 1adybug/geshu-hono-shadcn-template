export function toResponseBody(data: Uint8Array) {
    const body = new ArrayBuffer(data.byteLength)
    new Uint8Array(body).set(data)
    return body
}
