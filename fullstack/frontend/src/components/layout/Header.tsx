import { NavLink } from "react-router-dom";
import { useActiveUser } from "../../context/useActiveUser";
import { formatRole } from "../../data/users";

export function Header() {
  const { users, activeUser, setActiveUserId } = useActiveUser();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/suppliers" className="brand">
          Supplier Management
        </NavLink>
        <div className="user-switcher">
          <label htmlFor="active-user">Active user</label>
          <select
            id="active-user"
            value={activeUser.id}
            onChange={(event) => setActiveUserId(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({formatRole(user)})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
