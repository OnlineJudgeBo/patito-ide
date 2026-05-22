import type { LanguageDefinition, LanguageId } from '@/types/ide';

export const DEFAULT_LANGUAGE_ID: LanguageId = 'cpp';

export const LANGUAGES = [
  {
    id: 'cpp',
    label: 'C++17',
    monacoLanguage: 'cpp',
    judgeLanguage: 'cpp17',
    extension: 'cpp',
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  return 0;
}
`,
  },
  {
    id: 'python',
    label: 'Python 3',
    monacoLanguage: 'python',
    judgeLanguage: 'python3',
    extension: 'py',
    defaultCode: `def main():
    pass


if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'java',
    label: 'Java 17',
    monacoLanguage: 'java',
    judgeLanguage: 'java17',
    extension: 'java',
    defaultCode: `public class Main {
  public static void main(String[] args) throws Exception {

  }
}
`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    judgeLanguage: 'nodejs',
    extension: 'js',
    defaultCode: `function main() {

}

main();
`,
  },
  {
    id: 'rust',
    label: 'Rust',
    monacoLanguage: 'rust',
    judgeLanguage: 'rust',
    extension: 'rs',
    defaultCode: `fn main() {

}
`,
  },
  {
    id: 'go',
    label: 'Go',
    monacoLanguage: 'go',
    judgeLanguage: 'go',
    extension: 'go',
    defaultCode: `package main

func main() {

}
`,
  },
] as const satisfies readonly LanguageDefinition[];

export function isLanguageId(value: string): value is LanguageId {
  return LANGUAGES.some((language) => language.id === value);
}

export function getLanguage(languageId: LanguageId): LanguageDefinition {
  return LANGUAGES.find((language) => language.id === languageId) ?? LANGUAGES[0];
}

export function createDefaultCodeByLanguage(): Record<LanguageId, string> {
  return LANGUAGES.reduce(
    (codeByLanguage, language) => ({ ...codeByLanguage, [language.id]: language.defaultCode }),
    {} as Record<LanguageId, string>,
  );
}

export function defaultCodeFor(languageId: LanguageId): string {
  return getLanguage(languageId).defaultCode;
}
