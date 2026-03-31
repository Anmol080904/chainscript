def compute_diff(old: str, new: str):
    old_lines = old.splitlines()
    new_lines = new.splitlines()

    n = len(old_lines)
    m = len(new_lines)

    max_d = n + m
    v = {1: 0}
    trace = []

    for d in range(max_d + 1):
        new_v = {}
        for k in range(-d, d + 1, 2):
            if k == -d or (k != d and v.get(k - 1, 0) < v.get(k + 1, 0)):
                x = v.get(k + 1, 0)
            else:
                x = v.get(k - 1, 0) + 1

            y = x - k

            while x < n and y < m and old_lines[x] == new_lines[y]:
                x += 1
                y += 1

            new_v[k] = x

            if x >= n and y >= m:
                trace.append(new_v)
                return build_diff(trace, old_lines, new_lines)

        trace.append(new_v)
        v = new_v

    return []


def build_diff(trace, old_lines, new_lines):
    x = len(old_lines)
    y = len(new_lines)
    result = []

    for d in reversed(range(len(trace))):
        v = trace[d]
        k = x - y

        if k == -d or (k != d and v.get(k - 1, 0) < v.get(k + 1, 0)):
            prev_k = k + 1
            op = "insert"
        else:
            prev_k = k - 1
            op = "delete"

        prev_x = trace[d - 1][prev_k] if d > 0 else 0
        prev_y = prev_x - prev_k
        while x > prev_x and y > prev_y:
            result.append({
                "op": "equal",
                "line": y,
                "content": new_lines[y - 1]
            })
            x -= 1
            y -= 1

        if d == 0:
            break

        if op == "insert":
            result.append({
                "op": "insert",
                "line": y,
                "content": new_lines[y - 1]
            })
            y -= 1
        else:
            result.append({
                "op": "delete",
                "line": y + 1,
                "content": old_lines[x - 1]
            })
            x -= 1

    return list(reversed(result))