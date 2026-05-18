import type { LanguageDefinition, LanguageId } from '@/types/ide';

export const LANGUAGES: LanguageDefinition[] = [
  {
    id: 'cpp',
    label: 'C++ 17',
    monacoLanguage: 'cpp',
    judgeLanguage: 'cpp17',
    extension: 'cpp',
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    cout << n << '\n';
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
    defaultCode: `import sys

data = sys.stdin.read().strip().split()
it = iter(data)

n = int(next(it))
print(n)
`,
  },
  {
    id: 'java',
    label: 'Java 17',
    monacoLanguage: 'java',
    judgeLanguage: 'java17',
    extension: 'java',
    defaultCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        System.out.println(n);
    }
}
`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    judgeLanguage: 'javascript-node',
    extension: 'js',
    defaultCode: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split(/\s+/);
let idx = 0;

const n = Number(input[idx++]);
console.log(n);
`,
  },
  {
    id: 'rust',
    label: 'Rust',
    monacoLanguage: 'rust',
    judgeLanguage: 'rust',
    extension: 'rs',
    defaultCode: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut it = input.split_whitespace();

    let n: i64 = it.next().unwrap().parse().unwrap();
    println!("{}", n);
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

import "fmt"

func main() {
    var n int
    fmt.Scan(&n)
    fmt.Println(n)
}
`,
  },
];

export function getLanguage(languageId: LanguageId): LanguageDefinition {
  return LANGUAGES.find((language) => language.id === languageId) ?? LANGUAGES[0];
}
