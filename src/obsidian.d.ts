import "obsidian";

declare module "obsidian" {
	interface Workspace {
		on(
			name: string,
			callback: (menu: Menu, arg: unknown) => void,
			ctx?: unknown
		): unknown;
	}
}
