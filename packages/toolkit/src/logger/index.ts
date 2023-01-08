type LoggerType = "default" | "primary" | "success" | "warning" | "error";

export class Logger {
  /** Provides some logger built-in colors */
  protected static readonly builtInColor: Record<LoggerType, string> = {
    default: "#515a6e",
    primary: "#2d8cf0",
    success: "#19be6b",
    warning: "#ff9900",
    error: "#ed4014"
  };

  /**
   * The logger color log output, customized log
   * @param title The header title for the logger
   */
  public constructor(private readonly title?: string) {}

  /**
   * Get the corresponding color according to the log type
   * @param type The type of logger
   * @default "default"
   */
  protected getColor(type: LoggerType = "default"): string {
    return Logger.builtInColor[type];
  }

  /**
   * Print a [ title | desc ] style message
   * @param title Title of the log , displayed in the grid on the left
   * @param desc Desc of the log , displayed in the grid on the right
   * @param type The type of logger
   * @default "default"
   */
  protected capsule(title: string = "", desc: string = "", type?: LoggerType): void {
    console.log(
      `%c ${title} %c ${desc} %c`,
      "background:#35495E; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;",
      `background:${this.getColor(type)}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff;`,
      "background:transparent"
    );
  }

  /**
   * Default log output format
   * @param type The type of logger
   * @default "default"
   * @param message
   */
  public print(type: LoggerType, ...message: any[]): void {
    this.capsule(this.title, type.toUpperCase(), type);
    this.chalk({ type, text: ">>>>>>>>>>>>>>> START >>>>>>>>>>>>>>>" });
    console.log(...message);
    this.chalk({ type, text: ">>>>>>>>>>>>>>>> END >>>>>>>>>>>>>>>>" });
  }

  /**
   * Output color log in the console
   * @param texts
   */
  public chalk(...texts: { text?: string; type?: LoggerType; color?: string }[]): void {
    console.log(
      `%c${texts.map(t => t.text || "").join("%c")}`,
      ...texts.map(({ type, color }) => `color: ${color ? color : this.getColor(type)};`)
    );
  }

  /**
   * Print message in default style
   * @param message
   */
  public default(...message: any[]): void {
    return this.print("default", ...message);
  }

  /**
   * Print message in primary style
   * @param message
   */
  public primary(...message: any[]): void {
    return this.print("primary", ...message);
  }

  /**
   * Print message in success style
   * @param message
   */
  public success(...message: any[]): void {
    return this.print("success", ...message);
  }

  /**
   * Print message in warning style
   * @param message
   */
  public warning(...message: any[]): void {
    return this.print("warning", ...message);
  }

  /**
   * Print message in error style
   * @param message
   */
  public error(...message: any[]): void {
    return this.print("error", ...message);
  }
}
