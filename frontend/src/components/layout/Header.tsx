import { NavLink } from "react-router-dom";
import { useActiveUser } from "../../context/useActiveUser";
import { formatRoles } from "../../types/user";

export function Header() {
  const { users, activeUser, setActiveUserId } = useActiveUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink
          to="/suppliers"
          className="cursor-pointer text-sm font-semibold text-slate-900"
        >
          Supplier Management
        </NavLink>

        <div className="flex items-center gap-2">
          <label htmlFor="active-user" className="text-sm text-slate-600">
            Active user
          </label>
          <select
            id="active-user"
            value={activeUser.id}
            onChange={(event) => setActiveUserId(event.target.value)}
            className="min-h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({formatRoles(user)})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
