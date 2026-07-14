type IconProps = {
    svg: string;
    size?: number;
};

export function Icon({ svg, size = 24 }: IconProps) {
    return (
        <span
            className="inline-flex shrink-0 items-center justify-center leading-none"
            style={{ width: size, height: size }}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
