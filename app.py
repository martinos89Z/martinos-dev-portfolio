#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MARTINOS-DEV Portfolio Website
Serveur Flask pour le site web portfolio
@version 1.0.0
@author MARTINOS-DEV
"""

import os
import mimetypes
from flask import Flask, render_template, send_from_directory, abort, request
from werkzeug.exceptions import NotFound
from werkzeug.utils import secure_filename

# Configuration de l'application
app = Flask(__name__, 
           static_folder='.', 
           static_url_path='',
           template_folder='.')

# Configuration sécurisée
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key-change-in-production'),
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
    SEND_FILE_MAX_AGE_DEFAULT=31536000,   # Cache statique 1 an
)

# Types MIME autorisés pour la sécurité
ALLOWED_EXTENSIONS = {
    # Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico',
    # Styles et scripts
    '.css', '.js', '.map',
    # Documents
    '.html', '.htm', '.txt', '.md',
    # Polices
    '.woff', '.woff2', '.ttf', '.eot'
}

@app.route('/')
def index():
    """Page d'accueil du portfolio"""
    try:
        return render_template('index.html')
    except Exception as e:
        app.logger.error(f"Erreur lors du rendu de index.html: {e}")
        return "Erreur de chargement de la page", 500

@app.route('/<path:filename>')
def static_files(filename):
    """Servir les fichiers statiques de manière sécurisée"""
    try:
        # Sécurisation du nom de fichier
        filename = secure_filename(filename)
        
        # Vérification de l'existence du fichier
        if not os.path.exists(filename):
            app.logger.warning(f"Fichier non trouvé: {filename}")
            abort(404)
        
        # Vérification de l'extension
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            app.logger.warning(f"Extension non autorisée: {file_ext} pour {filename}")
            abort(403)
        
        # Détection automatique du type MIME
        mimetype = mimetypes.guess_type(filename)[0]
        
        return send_from_directory('.', filename, mimetype=mimetype)
        
    except NotFound:
        abort(404)
    except Exception as e:
        app.logger.error(f"Erreur lors du service du fichier {filename}: {e}")
        abort(500)

@app.errorhandler(404)
def not_found_error(error):
    """Gestionnaire d'erreur 404 personnalisé"""
    return render_template('index.html'), 404

@app.errorhandler(403)
def forbidden_error(error):
    """Gestionnaire d'erreur 403 personnalisé"""
    return "Accès interdit à ce fichier", 403

@app.errorhandler(500)
def internal_error(error):
    """Gestionnaire d'erreur 500 personnalisé"""
    return "Erreur interne du serveur", 500

@app.before_request
def security_headers():
    """Ajouter des en-têtes de sécurité"""
    # Bloquer les requêtes malveillantes
    if request.method == 'POST' and request.content_length and request.content_length > app.config['MAX_CONTENT_LENGTH']:
        abort(413)

@app.after_request
def after_request(response):
    """Ajouter des en-têtes de sécurité et de performance"""
    # En-têtes de sécurité
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # En-têtes de cache pour les fichiers statiques
    if request.endpoint == 'static_files':
        file_ext = os.path.splitext(request.path)[1].lower()
        if file_ext in ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']:
            response.headers['Cache-Control'] = 'public, max-age=31536000'  # 1 an
        else:
            response.headers['Cache-Control'] = 'public, max-age=86400'    # 1 jour
    
    return response

if __name__ == '__main__':
    # Configuration selon l'environnement
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 5001))
    host = os.environ.get('HOST', '127.0.0.1')
    
    print(f" Démarrage du serveur MARTINOS-DEV Portfolio")
    print(f" URL: http://{host}:{port}")
    print(f" Mode debug: {'Activé' if debug_mode else 'Désactivé'}")
    
    try:
        app.run(
            debug=debug_mode,
            host=host,
            port=port,
            threaded=True
        )
    except Exception as e:
        print(f" Erreur lors du démarrage du serveur: {e}")