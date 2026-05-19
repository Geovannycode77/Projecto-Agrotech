from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard_admin', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
DO $$
DECLARE cname text;
BEGIN
    SELECT c.conname INTO cname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE t.relname = 'login_cadastro_adminlog' AND a.attname = 'target_user_id'
    LIMIT 1;

    IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE login_cadastro_adminlog DROP CONSTRAINT ' || quote_ident(cname);
        EXECUTE 'ALTER TABLE login_cadastro_adminlog ADD CONSTRAINT ' || quote_ident(cname || '_setnull') ||
                ' FOREIGN KEY (target_user_id) REFERENCES login_cadastro_customuser(id) ON DELETE SET NULL';
    END IF;
END$$;
""",
            reverse_sql="SELECT 1;",
        ),
    ]
