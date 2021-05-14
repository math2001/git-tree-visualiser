function commit
    echo "$argv[1]" > "$argv[1]"
    git add "$argv[1]"
    git commit -m "$argv[1]"
end