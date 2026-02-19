type Props = {
  constructionDate: string;
};

export default function ProjectMeta({ constructionDate }: Props) {
  return (
    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
      <div>
        <span className="font-medium text-foreground">
          Construction date:
        </span>{" "}
        {new Date(constructionDate).toLocaleDateString()}
      </div>
    </div>
  );
}