import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Composer } from "@/components/Composer";

describe("Composer", () => {
  it("sends the trimmed message on Enter and clears the input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<Composer onSend={onSend} onClearChat={vi.fn()} disabled={false} hasMessages={false} />);

    const textarea = screen.getByLabelText("Message");
    await user.type(textarea, "  What is hardness?  ");
    await user.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledWith("What is hardness?", null);
    expect(textarea).toHaveValue("");
  });

  it("inserts a newline on Shift+Enter instead of sending", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<Composer onSend={onSend} onClearChat={vi.fn()} disabled={false} hasMessages={false} />);

    const textarea = screen.getByLabelText("Message");
    await user.type(textarea, "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(textarea, "line two");

    expect(onSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("line one\nline two");
  });

  it("does not send an empty or whitespace-only message", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<Composer onSend={onSend} onClearChat={vi.fn()} disabled={false} hasMessages={false} />);

    const textarea = screen.getByLabelText("Message");
    await user.type(textarea, "   ");
    await user.keyboard("{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables the send button while a reply is pending", () => {
    render(<Composer onSend={vi.fn()} onClearChat={vi.fn()} disabled hasMessages={false} />);
    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("disables Clear Chat when there are no messages", () => {
    render(<Composer onSend={vi.fn()} onClearChat={vi.fn()} disabled={false} hasMessages={false} />);
    expect(screen.getByText("Clear Chat").closest("button")).toBeDisabled();
  });
});
