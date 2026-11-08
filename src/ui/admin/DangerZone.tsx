import { Button } from "@/ui/primitives/Button";
import { Checkbox } from "@/ui/primitives/Field";

type Props = {
  title: string;
  warning: string;
  confirm: string;
  submit: string;
  action: () => Promise<void>;
};

/** Delete section: the button only works after the confirm box is checked. */
export function DangerZone({ title, warning, confirm, submit, action }: Props) {
  return (
    <section className="mt-16 flex flex-col gap-6 border-2 border-accent p-6">
      <h2 className="label text-accent">{title}</h2>
      <p>{warning}</p>
      <form action={action} className="flex flex-col gap-6">
        <Checkbox label={confirm} name="confirm" required />
        <Button type="submit" variant="outline" className="self-start">
          {submit}
        </Button>
      </form>
    </section>
  );
}