const MAX_LENGTH = 5000;

const CodeAnswerBox = ({ value, onChange }) => (
  <div>
    <label htmlFor="answer" className="mb-2 block text-sm text-muted">
      Your answer
    </label>
    <textarea
      id="answer"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={MAX_LENGTH}
      rows={16}
      spellCheck={false}
      placeholder="Write your answer here"
      className="w-full resize-y rounded-lg border border-line bg-ground p-3 font-mono text-sm text-ink placeholder:text-muted"
    />
    <p className="mt-1 text-right font-mono text-xs text-muted">
      {value.length} / {MAX_LENGTH}
    </p>
  </div>
);

export default CodeAnswerBox;
