declare module 'co' {
  interface ICo {
    (gen: any): any;
  }
  const co: ICo;

  export = co;
}
