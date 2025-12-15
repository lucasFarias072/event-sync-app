

export class UnauthorizedException extends Error {
    constructor(message = 'Não autorizado') {
        super(message)
        this.name = 'UnauthorizedException'
        this.statusCode = 401
    }
}
