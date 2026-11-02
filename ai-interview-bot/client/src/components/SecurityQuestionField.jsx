import { SECURITY_QUESTIONS } from "../constants/securityQuestions.js";

const inputClass =
  "w-full rounded-md border border-line bg-ground/40 px-3 py-2 text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50";

const SecurityQuestionField = ({
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
}) => (
  <>
    <div className="mt-4">
      <label htmlFor="securityQuestion" className="block text-sm text-muted">
        Security question
      </label>
      <select
        id="securityQuestion"
        name="securityQuestion"
        required
        value={question}
        onChange={onQuestionChange}
        className={`${inputClass} mt-1`}
      >
        <option value="" disabled>
          Choose a question
        </option>
        {SECURITY_QUESTIONS.map((item) => (
          <option
            key={item.key}
            value={item.key}
            className="bg-ground text-ink"
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>

    <div className="mt-4">
      <label htmlFor="securityAnswer" className="block text-sm text-muted">
        Your answer
      </label>
      <input
        id="securityAnswer"
        name="securityAnswer"
        type="text"
        autoComplete="off"
        required
        minLength={2}
        maxLength={60}
        disabled={!question}
        value={answer}
        onChange={onAnswerChange}
        placeholder={question ? "Type your answer" : "Choose a question first"}
        aria-describedby="securityAnswer-hint"
        className={`${inputClass} mt-1`}
      />
      <p id="securityAnswer-hint" className="mt-1 text-xs text-muted">
        You need this answer to reset your password. Capital letters and
        punctuation do not matter.
      </p>
    </div>
  </>
);

export default SecurityQuestionField;
