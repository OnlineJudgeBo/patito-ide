export type LanguageId = string;
export type AllowedLanguageValue = number | string;

export type LanguageDefinition = {
  readonly id: LanguageId;
  readonly label: string;
  readonly monacoLanguage: string;
  readonly judgeLanguage: string;
  readonly extension: string;
  readonly defaultCode: string;
  readonly judgeLanguageId?: number;
};

export type ApiLanguageDefinition = {
  readonly id?: string;
  readonly label?: string;
  readonly judgeLanguageId?: number;
  readonly judgeLanguage?: string;
  readonly name?: string;
  readonly ideLanguage?: LanguageId | null;
  readonly monacoLanguage?: string;
  readonly extension?: string;
  readonly template?: string;
  readonly defaultCode?: string;
};
