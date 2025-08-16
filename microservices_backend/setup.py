from setuptools import setup, find_packages

setup(
    name="whiplash_services",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-cors',
        'pymongo',
        'python-dotenv',
        'requests',
        'google-generativeai',
        'rich',
        'pandas',
        'sqlalchemy',
        'pymysql',
        'pydantic',
        'fastapi',
        'uvicorn'
    ],
    python_requires='>=3.8',
)
