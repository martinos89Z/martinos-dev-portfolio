# Plan de résolution de l'erreur 503 sur Render.com

## 1. Créer un fichier wsgi.py

Créez un fichier `wsgi.py` à la racine de votre projet avec le contenu suivant :

```python
import os
import sys

# Ajouter le répertoire courant au chemin Python
sys.path.insert(0, os.path.dirname(__file__))

from app import app as application

if __name__ == "__main__":
    application.run()
```

## 2. Modifier le fichier render.yaml

Modifiez votre fichier `render.yaml` comme suit :

```yaml
services:
  - type: web
    name: martinos-dev-portfolio
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        generateValue: true
      - key: FLASK_ENV
        value: production
      - key: HOST
        value: 0.0.0.0
    autoDeploy: true
```

## 3. Créer un fichier gunicorn_config.py

Créez un fichier `gunicorn_config.py` à la racine de votre projet :

```python
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '10000')}"
workers = 2
threads = 2
timeout = 120
accesslog = "-"
errorlog = "-"
loglevel = "info"
```

## 4. Modifier le Procfile

Modifiez votre fichier `Procfile` comme suit :

```
web: gunicorn --config gunicorn_config.py wsgi:application
```

## 5. Vérifier que tous les fichiers statiques sont inclus

Assurez-vous que tous vos fichiers statiques (CSS, JS, images) sont bien inclus dans votre dépôt Git.

## 6. Effectuer un déploiement manuel avec cache vidé

1. Dans le tableau de bord Render, cliquez sur "Manual Deploy"
2. Sélectionnez "Clear build cache & deploy"
3. Suivez les logs pour voir si cela résout le problème

## 7. Vérifier les logs après déploiement

Après le déploiement, vérifiez les logs pour identifier d'éventuelles erreurs :
1. Allez dans l'onglet "Logs" de votre service sur Render
2. Sélectionnez "All" pour voir tous les logs
3. Recherchez des messages d'erreur spécifiques

## 8. Tester l'application

Une fois le déploiement terminé, testez votre application en accédant à l'URL fournie par Render.