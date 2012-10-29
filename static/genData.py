# coding: utf-8
out = {}
names = [l.strip() for l in open("list.txt").readlines() if len(l.strip()) > 2]
import json
import random
pattern = json.loads("""{"name": "Руан", "resource": "rock", "level": 2, "fort": 4, "owner": "Джонатан Арчер", "family": "Пикарды"}""")
for x in range(300):
    p = dict(pattern)
    p["owner"] = random.sample(names, 1)[0]; p["name"] = u"Провинция %d" % x
    p["fort"] = random.randint(1, 10)
    p["level"] = random.randint(1, 10); p["resource"] = random.sample(["Овцы", "Зерно", "Вино", "Металл"], 1)[0]
    p["road"] = random.sample([0, 1], 1)[0]; out[x] = p
    
with open("../data.js", "w") as f:
    f.write("callback(%s)" % (json.dumps(out)))
    
