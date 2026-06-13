// The chat template / role formatting a typical model applies before
// tokenizing. Shown verbatim in the Input stage and tokenized for real after.
// (ChatML-style, for illustration — templates vary by model family.)
export function applyChatTemplate(userText: string): string {
  return `<|im_start|>user\n${userText}<|im_end|>\n<|im_start|>assistant\n`
}
