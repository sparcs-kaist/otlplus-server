export class OrderDto {
  constructor(
    public email: string,
    public productName: string,
    public quantity: number,
  ) {}
}

export class AppDto {
  constructor(public message: string) {}
}
