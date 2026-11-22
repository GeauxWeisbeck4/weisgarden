// mdast -> hast rendering hints. These normally come from `mdast-util-to-hast`, which is only a
// transitive dependency here, so its type augmentation isn't picked up automatically.
import type { ElementContent, Properties } from "hast";

declare module "mdast" {
	interface Data {
		/** Tag name to render this node as */
		hName?: string | undefined;
		/** Properties to set on the rendered element */
		hProperties?: Properties | undefined;
		/** Children to render instead of the node's own */
		hChildren?: ElementContent[] | undefined;
	}
}
