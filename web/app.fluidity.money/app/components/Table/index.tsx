import { Link, useTransition } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { Text } from "@fluidity-money/surfing";

// type Filter<T> = {
//   filter: (item: T) => boolean;
//   name: string;
// };

export type ColumnProps = {
  name: string;
  alignRight?: boolean;
};

export type PaginationProps = {
  page: number;
  rowsPerPage: number;
  pageQuery?: string;
};

export type IRow<T> = React.FC<{ data: T; index: number }>;

type ITable<T> = {
  className?: string;
  itemName?: string;
  headings: ColumnProps[];

  pagination: PaginationProps;

  count: number;

  // Used for filters
  data: T[];

  // Render data into row
  renderRow: IRow<T>;

  // Filters based on elementData
  // filters?: Filter<T>[]; F
};

const Table = <T,>(props: ITable<T>) => {
  const { itemName, pagination, data, renderRow, count, headings } = props;

  const { rowsPerPage, page } = pagination;

  const pageCount = Math.ceil(count / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, count);

  const isTransition = useTransition();

  return (
    <div>
      <div className="transactions-header row justify-between">
        {/* Item Count */}
        <Text>
          {startIndex}-{endIndex} of {count} {itemName}
        </Text>

        {/* Filters - SCOPED OUT */}
        {/*filters && (
          <div>
            {filters.map(filter => (
              <span>{filter.name}</span>
            ))}
          </div>
        )*/}
      </div>

      {/* Table */}
      <table>
        {/* Table Headings */}
        <thead>
          <tr>
            {headings.map((heading) => {
              const alignProps = heading.alignRight
                ? "alignRight"
                : "alignLeft";
              const classProps = `heading ${alignProps}`;

              return (
                <th className={classProps} key={heading.name}>
                  <Text>{heading.name}</Text>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.tbody
            key={`page-${page}`}
            initial="enter"
            animate={isTransition.state === "idle" ? "enter" : "transitioning"}
            exit="exit"
            variants={{
              enter: {
                opacity: 1,
                transition: {
                  when: "beforeChildren",
                  staggerChildren: 0.05,
                },
              },
              exit: {
                opacity: 0,
                transition: {
                  when: "afterChildren",
                  staggerChildren: 0.05,
                },
              },
              transitioning: {},
            }}
          >
            {data.map((row, i) => renderRow({ data: row, index: i }))}
          </motion.tbody>
        </AnimatePresence>
      </table>

      {/* Pagination */}
      <motion.div className="pagination" layout="position">
        {Array(pageCount)
          .fill()
          .map((_, i) => {
            return (
              <Link key={i} to={`?${pagination.pageQuery || "page"}=${i + 1}`}>
                {i + 1}
              </Link>
            );
          })}
      </motion.div>
    </div>
  );
};

export default Table;