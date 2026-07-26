<script>
	import SortableHeader from './SortableHeader.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {any[]} [items]
	 * @property {any[]} [columns]
	 * @property {any[]} [actions]
	 * @property {string} [sortKey]
	 * @property {string} [sortDirection]
	 * @property {boolean} [capitalizeHeaders]
	 * @property {string} [actionsWidth]
	 * @property {string} [actionGap]
	 * @property {boolean} [canManage]
	 * @property {boolean} [noFrame]
	 * @property {function} [rowClick]
	 * @property {function} [rowClass]
	 * @property {function} [onSort]
	 * @property {function} [onAction]
	 * @property {import('svelte').Snippet<[any, any]> | null} [cell]
	 * @property {import('svelte').Snippet<[any]> | null} [actionCell]
	 */

	/** @type {Props} */
	let {
		items = [],
		columns = [],
		actions = [],
		sortKey = '',
		sortDirection = 'asc',
		capitalizeHeaders = false,
		actionsWidth = '80px',
		actionGap = 'gap-2',
		canManage = false,
		noFrame = false,
		rowClick = () => {},
		rowClass = () => '',
		onSort = () => {},
		onAction = () => {},
		cell = null,
		actionCell = null
	} = $props();

	/**
	 * @param {string} actionName
	 * @param {any} item
	 * @param {any} event
	 */
	function handleAction(actionName, item, event) {
		event.stopPropagation();
		onAction({ name: actionName, item });
	}
</script>

<div class={noFrame ? "w-full" : "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300"}>
	<div class="overflow-x-auto">
		<table class="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-800">
			<thead class="bg-gray-50/75 dark:bg-gray-950/80">
				<tr>
					{#each columns as col}
						<th
							class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider {capitalizeHeaders ? 'uppercase' : ''}"
							style="width: {col.width || 'auto'}"
						>
							{#if col.sortable}
								<div class="flex justify-start text-left">
									<SortableHeader
										title={col.title}
										sortKey={col.key}
										currentSortKey={sortKey}
										currentSortDirection={sortDirection}
										onSort={onSort}
									/>
								</div>
							{:else}
								<span class="block text-left">{col.title}</span>
							{/if}
						</th>
					{/each}
					{#if canManage}
						<th
							class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider {capitalizeHeaders ? 'uppercase' : ''}"
							style="width: {actionsWidth}"
						>
							Actions
						</th>
					{/if}
				</tr>
			</thead>
			<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800/50">
				{#each items || [] as item}
					<tr class="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors {rowClass(item)}" onclick={() => rowClick(item)}>
						{#each columns as col}
							<td
								class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 align-middle {col.overflow === 'wrap' ? '' : 'max-w-0'}"
								style="{col.overflow === 'wrap' ? 'word-break: break-word;' : ''}"
							>
								<div
									class="{col.overflow === 'wrap' ? 'whitespace-normal' : 'truncate overflow-hidden'}"
									style="{col.overflow === 'wrap' ? 'word-break: break-word; overflow-wrap: break-word;' : ''}"
								>
									{#if cell}
										{@render cell(item, col)}
									{:else}
										{item[col.key] ?? '-'}
									{/if}
								</div>
							</td>
						{/each}

						{#if canManage}
							<td class="px-4 py-3 whitespace-nowrap text-sm text-right align-middle">
								<div class="flex items-center justify-end {actionGap} opacity-0 group-hover:opacity-100 transition-opacity">
									{#if actionCell}
										{@render actionCell(item)}
									{:else}
										{#each actions as action}
											<button
												onclick={(event) => handleAction(action.name, item, event)}
												class="transition-all focus:outline-none cursor-pointer {action.class || 'text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'}"
												title={action.title || ''}
											>
												<action.icon size={16} />
											</button>
										{/each}
									{/if}
								</div>
							</td>
						{/if}
					</tr>
				{:else}
					<tr>
						<td colspan={columns.length + (canManage ? 1 : 0)} class="px-6 py-16 text-center text-gray-400 dark:text-gray-500 italic">
							No records found.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
