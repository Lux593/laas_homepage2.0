// Type stubs for Framer's built-in module (available at runtime in Framer editor)
declare module "framer" {
  export const ControlType: {
    Boolean: string
    Number: string
    String: string
    Color: string
    Image: string
    File: string
    Enum: string
    Array: string
    Object: string
    ComponentInstance: string
    Link: string
    ResponsiveImage: string
  }

  export function addPropertyControls(
    component: React.ComponentType<any>,
    controls: Record<string, any>
  ): void
}
