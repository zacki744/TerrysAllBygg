type ProjectCardProps = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export default function ProjectCard({
  id,
  title,
  description,
  image,
}: ProjectCardProps) {
  return (
    <a 
      href={`/projects.html?id=${id}`}
      className="block"
    >
      <div
        className="
          group
          overflow-hidden
          rounded-xl
          border border-border
          bg-background
          shadow-[0_4px_12px_rgba(200,107,60,0.4)]
          transition-all
          duration-300
          ease-out
          hover:-translate-y-1
          hover:scale-[1.02]
          hover:shadow-[0_6px_20px_rgba(200,107,60,0.4)]
          cursor-pointer
        "
      >
        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover"
        />

        <div className="p-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="mt-2 text-sm text-zinc-600 line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}