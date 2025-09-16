// Example tool
export async function example_tool({ message }: { message: string }) {
  return { echo: message };
}
