export interface AuthStrategy {
  authenticate(email: string, password: string): Promise<any>;
}
