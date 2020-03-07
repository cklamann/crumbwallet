#!bash
echo "creating admin user"
"${mongo[@]}" app <<-EOJS
	    db.createUser({
        user: "${DB_USER}",
   	    pwd: "${DB_PASSWORD}",
    	roles: [{ db: "app", role: "readWrite" }]	
	});
EOJS
