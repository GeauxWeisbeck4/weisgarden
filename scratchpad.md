<!-- <nav
				class="md:text-2xl flex-1 text-center text-xl font-medium text-gray-700 lg:text-3xl"
				x-data="{
    navbarLinks: [
      { path: '/about', title: 'About' },
      { path: '/notes', title: 'Notes' },
      { path: '/posts', title: 'Posts' },
      { path: '/projects', title: 'Projects' },
      { path: '/links', title: 'Links' },
      { path: '/support', title: 'Support' },
    ]
  }"
			<nav
				class="md:text-2xl flex-1 text-center text-xl font-medium text-gray-700 lg:text-3xl"
				x-data="{ navbarLinks: [] }"
				x-init="navbarLinks = await (await fetch(navbarLinks)).json()"
			>
				<template x-for="(link, i) in navbarLinks" :key="link.path">
					<span>
						<a
							class="md:text-lg lg:text-xl inline-block text-lg font-bold transition-colors hover:text-teal-600"
							:href="link.path"
							x-text="link.title"></a>
						<template x-if="i != navbarLinks.length - 1">
							<span class="text-black">|</span>
						</template>
					</span>
				</template>
			</nav> -->

