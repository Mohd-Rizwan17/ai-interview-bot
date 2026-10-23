const LETTERS = ["A", "B", "C", "D"];

const McqOptions = ({ options, selected, onSelect }) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-3 text-sm text-muted">Choose one answer</legend>
    {options.map((option, index) => (
      <label
        key={index}
        className="glass-solid flex cursor-pointer items-start gap-3 rounded-lg p-4 hover:border-(--glass-border-hover) has-[:checked]:border-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
      >
        <input
          type="radio"
          name="option"
          value={index}
          checked={selected === index}
          onChange={() => onSelect(index)}
          className="sr-only"
        />
        <span className="font-mono text-sm text-accent">{LETTERS[index]}</span>
        <span>{option}</span>
      </label>
    ))}
  </fieldset>
);

export default McqOptions;
