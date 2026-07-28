import type { ZodRawShape } from 'zod';

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
};

export type ToolConfig = {
  description: string;
  inputSchema?: ZodRawShape;
};

export type ToolHandler = (args: any) => Promise<ToolResult>;

export type ToolRegistrar = {
  registerTool(name: string, config: ToolConfig, handler: ToolHandler): void;
};
